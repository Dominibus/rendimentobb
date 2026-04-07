import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= HELPER =================
function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= TEMPLATE =================
function buildEmail({ lang, step }){

  const CTA = "https://www.rendimentobb.it/tool/";

  const content = {

    2: {
      title: t(lang,
        "Stai sottovalutando il rischio",
        "You may be underestimating risk"
      ),
      text: t(lang,
        "Molti investitori credono di avere un ROI del 10-12%, ma quando analizzano davvero i dati scoprono che è molto più basso.",
        "Many investors believe they have 10-12% ROI, but real analysis shows it’s often much lower."
      ),
      highlight: t(lang,
        "Il problema non è il ROI… è tutto il resto.",
        "The problem isn’t ROI… it’s everything else."
      ),
      subject: t(lang,
        "🔥 72% degli investitori sbaglia questo",
        "🔥 72% of investors get this wrong"
      )
    },

    3: {
      title: t(lang,
        "Ultimo controllo prima di investire",
        "Final check before investing"
      ),
      text: t(lang,
        "Un investimento sbagliato può costarti migliaia di euro. Ma evitarlo richiede meno di 30 secondi.",
        "A wrong investment can cost thousands. Avoiding it takes less than 30 seconds."
      ),
      highlight: t(lang,
        "Questa è la differenza tra profitto e perdita.",
        "This is the difference between profit and loss."
      ),
      subject: t(lang,
        "⚠️ Ultimo avviso prima di investire",
        "⚠️ Final check before investing"
      )
    }

  };

  const c = content[step];

  return {
    subject: c.subject,

    html: `
    <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

      <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

        <!-- LOGO -->
        <div style="text-align:center;margin-bottom:25px">
          <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
        </div>

        <!-- TITLE -->
        <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
          ${c.title}
        </h2>

        <!-- TEXT -->
        <p style="text-align:center;color:#64748b;font-size:15px">
          ${c.text}
        </p>

        <!-- HIGHLIGHT -->
        <div style="
          margin-top:20px;
          background:#fff7ed;
          padding:16px;
          border-radius:12px;
          color:#92400e;
          font-weight:600;
          text-align:center;
        ">
          ⚠️ ${c.highlight}
        </div>

        <!-- VALUE -->
        <div style="
          margin-top:25px;
          background:#f8fafc;
          padding:18px;
          border-radius:12px;
          font-size:14px;
          color:#334155;
        ">
          <ul style="margin:0;padding-left:18px;line-height:1.7">
            <li>${t(lang,"ROI reale dopo costi","Real ROI after costs")}</li>
            <li>${t(lang,"Break-even occupancy","Break-even occupancy")}</li>
            <li>${t(lang,"Impatto mutuo","Mortgage impact")}</li>
            <li>${t(lang,"Scenario rischio","Risk scenario")}</li>
          </ul>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:35px 0">

          <a href="${CTA}"
          style="
          background:linear-gradient(135deg,#10b981,#059669);
          color:white;
          padding:16px 28px;
          border-radius:999px;
          text-decoration:none;
          font-weight:700;
          display:inline-block;
          box-shadow:0 10px 30px rgba(16,185,129,0.4);
          ">
          🚀 ${t(lang,"Fai ora l’analisi completa","Run full analysis now")}
          </a>

          <p style="font-size:12px;color:#94a3b8;margin-top:10px">
            ${t(lang,
              "Analisi avanzata in meno di 30 secondi",
              "Advanced analysis in under 30 seconds"
            )}
          </p>

        </div>

        <!-- FOOTER -->
        <p style="text-align:center;font-size:12px;color:#94a3b8">
          RendimentoBB – ${t(lang,
            "motore decisionale investimenti B&B",
            "decision engine for B&B investments"
          )}
        </p>

      </div>

    </div>
    `
  };
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  try{

    const { email, lang = "it", step = 2 } = req.body;

    if(!email){
      return res.status(400).json({ error: "Email missing" });
    }

    const emailContent = buildEmail({ lang, step });

    await resend.emails.send({
      from: "RendimentoBB <analisi@rendimentobb.it>",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html
    });

    return res.status(200).json({ success: true });

  }catch(err){

    console.error(err);

    return res.status(500).json({ error: "Email failed" });
  }

}
