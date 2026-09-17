export async function onRequestPost(context) {
const formData = await context.request.formData();
 
const response = await fetch("https://api.resend.com/emails",
{
method: "POST",
headers: {
"Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
from: "website@forthelovedog.com",
to: ["clairefortheloveofdog@gmail.com"],
subject: `New Consultation Request - ${formData.get("Name")}`,
html: `
<h2>New Consultation Request</h2>
 
<p><strong>Name:</strong> ${formData.get("Name")}</p>
<p><strong>Email:</strong> ${formData.get("Email")}</p>
<p><strong>Dog Name:</strong> ${formData.get("Dog Name")}</p>
<p><strong>Main Concern:</strong> ${formData.get("Main Concern")}</p>
 
<p><strong>Goals:</strong></p>
<p>${formData.get("Goals")}</p>
`
})
});
 
if (!response.ok) {
return new Response("Email failed to send", {
status: 500
});
}
 
return Response.redirect(
new URL("/consultation.html?success=true", context.request.url),
302
);
}
