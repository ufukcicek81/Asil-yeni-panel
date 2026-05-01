export default {
  async fetch(request) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    try {
      const altinRes = await fetch("https://www.haremaltin.com/tmp/altin.json", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
          "Referer": "https://www.haremaltin.com/"
        }
      });

      const altinData = await altinRes.json();

      function parseNumber(v) {
        if (v === null || v === undefined) return 0;
        let s = String(v).trim().replace(/[^\d.,-]/g, "");

        if (s.indexOf(",") > -1 && s.indexOf(".") > -1) {
          if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
            s = s.replace(/\./g, "").replace(",", ".");
          } else {
            s = s.replace(/,/g, "");
          }
        } else if (s.indexOf(",") > -1) {
          s = s.replace(",", ".");
        }

        const n = Number(s);
        return Number.isFinite(n) ? n : 0;
      }

      function pick(obj, keys) {
        for (const k of keys) {
          if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return 0;
      }

      const hasObj =
        altinData["Has Altın"] ||
        altinData["HAS ALTIN"] ||
        altinData["ALTIN"] ||
        altinData["HAS"] ||
        altinData["data"]?.["Has Altın"] ||
        altinData["data"]?.["ALTIN"] ||
        {};

      const hasAltinAlis = parseNumber(pick(hasObj, ["Alış", "alis", "buy", "BUY", "satis_fiyat"]));
      const hasAltinSatis = parseNumber(pick(hasObj, ["Satış", "satis", "sell", "SELL", "alis_fiyat"]));

      const html = await fetch("https://kur.doviz.com/harem", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      }).then(r => r.text());

      function getCurrency(code) {
        const clean = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ");

        const upper = clean.toUpperCase();
        let idx = upper.indexOf(code + " HAREM");
        if (idx === -1) idx = upper.indexOf(code);
        if (idx === -1) return { alis: 0, satis: 0 };

        const part = clean.slice(idx, idx + 300);
        const nums = part.match(/\d{1,3}(?:[.,]\d{2,4})?/g);

        if (!nums || nums.length < 2) return { alis: 0, satis: 0 };

        return {
          alis: parseNumber(nums[0]),
          satis: parseNumber(nums[1])
        };
      }

      const usd = getCurrency("USD");
      const eur = getCurrency("EUR");
      const gbp = getCurrency("GBP");
      const chf = getCurrency("CHF");
      const sar = getCurrency("SAR");

      return new Response(JSON.stringify({
        hasAlis: hasAltinAlis,
        hasSatis: hasAltinSatis,

        hasAltin: {
          alis: hasAltinAlis,
          satis: hasAltinSatis
        },

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

        usd,
        eur,
        gbp,
        chf,
        sar,

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
