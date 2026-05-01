export default {
  async fetch(request) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    try {

      // 🔹 HAS ALTIN (BOZULMAZ)
      const altinRes = await fetch("https://www.haremaltin.com/tmp/altin.json", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const altinData = await altinRes.json();

      function parseNumber(v) {
        if (!v) return 0;
        let s = String(v).replace(/[^\d.,]/g, "");

        if (s.includes(",") && s.includes(".")) {
          if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
            s = s.replace(/\./g, "").replace(",", ".");
          } else {
            s = s.replace(/,/g, "");
          }
        } else if (s.includes(",")) {
          s = s.replace(",", ".");
        }

        return Number(s) || 0;
      }

      const hasAltinAlis = parseNumber(
        altinData["Has Altın"]?.Alış || altinData.ALTIN?.Alış
      );

      const hasAltinSatis = parseNumber(
        altinData["Has Altın"]?.Satış || altinData.ALTIN?.Satış
      );

      // 🔹 DOVIZ.COM HAREM
      const html = await fetch("https://kur.doviz.com/harem", {
        headers: { "User-Agent": "Mozilla/5.0" }
      }).then(r => r.text());

      function getCurrency(code) {
        const clean = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ");

        const regex = new RegExp(
          code + "\\s+Harem[^0-9]*([0-9]+,[0-9]+)\\s+([0-9]+,[0-9]+)",
          "i"
        );

        const m = clean.match(regex);

        if (!m) return { alis: 0, satis: 0 };

        return {
          alis: parseNumber(m[1]),
          satis: parseNumber(m[2])
        };
      }

      const usd = getCurrency("USD");
      const eur = getCurrency("EUR");
      const gbp = getCurrency("GBP");
      const chf = getCurrency("CHF");
      const sar = getCurrency("SAR");

      return new Response(JSON.stringify({

        // ALTIN
        hasAlis: hasAltinAlis,
        hasSatis: hasAltinSatis,
        hasAltin: {
          alis: hasAltinAlis,
          satis: hasAltinSatis
        },

        // DÖVİZ (SADECE HAREM)
        usdAlis: usd.alis,
        usdSatis: usd.satis,

        eurAlis: eur.alis,
        eurSatis: eur.satis,

        gbpAlis: gbp.alis,
        gbpSatis: gbp.satis,

        chfAlis: chf.alis,
        chfSatis: chf.satis,

        sarAlis: sar.alis,
        sarSatis: sar.satis,

        // obje olarak da veriyoruz (index uyumlu)
        usd, eur, gbp, chf, sar,

        updatedAt: new Date().toISOString()

      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({
        error: true,
        message: e.message
      }), { headers });
    }
  }
};
