import { NextResponse } from "next/server";

type ReqBody = {
  destination_city_id: number;
  couriers: string[];          // contoh: ["jne","pos","tiki"]
  total_weight_gram: number;   // total berat order (gram)
  price?: "lowest" | "highest"; // opsional, filter biaya terendah/tertinggi
};

function badRequest(message: string) {
  return NextResponse.json({ error: "INVALID_REQUEST", message }, { status: 400 });
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ReqBody>;

    const destinationId = Number(body.destination_city_id);
    const weight = Math.round(Number(body.total_weight_gram));
    const couriers = Array.isArray(body.couriers)
      ? body.couriers.map((c) => String(c).trim().toLowerCase()).filter(Boolean)
      : [];

    const price = body.price ? String(body.price).toLowerCase() : undefined;
    const priceFilter = price === "lowest" || price === "highest" ? price : undefined;

    if (!Number.isFinite(destinationId) || destinationId <= 0) {
      return badRequest("destination_city_id wajib number > 0");
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      return badRequest("total_weight_gram wajib number > 0");
    }
    if (couriers.length === 0) {
      return badRequest("couriers wajib array minimal 1 item");
    }

    const baseUrl = process.env.RAJAONGKIR_BASE_URL || "https://rajaongkir.komerce.id/api/v1";
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const originId = Number(process.env.URBYNO_ORIGIN_ID);

    if (!apiKey) {
      return NextResponse.json(
        { error: "SERVER_MISCONFIG", message: "RAJAONGKIR_API_KEY belum di-set" },
        { status: 500 }
      );
    }
    if (!Number.isFinite(originId) || originId <= 0) {
      return NextResponse.json(
        { error: "SERVER_MISCONFIG", message: "URBYNO_ORIGIN_ID belum valid" },
        { status: 500 }
      );
    }

    // RajaOngkir endpoint menerima 1 courier per request (courier=string)
    // jadi kita loop per courier lalu gabungkan
    const results = await Promise.all(
      couriers.map(async (courier) => {
        const form = new URLSearchParams();
        form.set("origin", String(originId));
        form.set("destination", String(destinationId));
        form.set("weight", String(weight));
        form.set("courier", courier);
        if (priceFilter) form.set("price", priceFilter);

        const res = await fetchWithTimeout(`${baseUrl}/calculate/domestic-cost`, {
          method: "POST",
          headers: {
            key: apiKey,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        });

        const json = await res.json().catch(() => null);

        // Kalau invalid courier / data null → kembalikan kosong tapi tidak bikin seluruh endpoint gagal
        if (!res.ok || !json?.data) {
          return {
            courier_code: courier,
            courier_name: courier.toUpperCase(),
            services: [],
            _error: json?.meta?.message || `RajaOngkir error (HTTP ${res.status})`,
          };
        }

        // Berdasarkan docs, json.data adalah array:
        // { name, code, service, description, cost, etd } :contentReference[oaicite:1]{index=1}
        const rows: any[] = json.data;

        const courierName = (rows?.[0]?.name as string) ?? courier.toUpperCase();

        const services = rows.map((row) => ({
          service: String(row.service ?? ""),
          description: String(row.description ?? ""),
          cost: Number(row.cost ?? 0),
          etd: String(row.etd ?? ""),
          note: "",
        }));

        return {
          courier_code: courier,
          courier_name: courierName,
          services,
        };
      })
    );

    const cleaned = results
      .filter((r) => r.services && r.services.length > 0)
      .map((r) => ({
        courier_code: r.courier_code,
        courier_name: r.courier_name,
        services: r.services,
      }));

    return NextResponse.json({
      origin_city_id: originId,
      destination_city_id: destinationId,
      total_weight_gram: weight,
      results: cleaned,
      meta: {
        requested_couriers: couriers,
        price: priceFilter ?? null,
        empty_couriers: results.filter((r) => r.services.length === 0).map((r) => r.courier_code),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
