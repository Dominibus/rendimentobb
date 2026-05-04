// ===============================
// 🔁 SEND LEAD PARTNER → REDIRECT TO MAIN ENGINE
// ===============================

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    console.log("⚠️ send-lead-partner chiamato → redirect a send-lead");

    // inoltra la richiesta al vero endpoint
    const response = await fetch(
      `${process.env.BASE_URL || "https://rendimentobb.it"}/api/send-lead`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    return res.status(200).json({
      redirected: true,
      ...data
    });

  }catch(err){

    console.error("💥 redirect error:", err);

    return res.status(200).json({
      success:false,
      error:"redirect_failed"
    });
  }
}
