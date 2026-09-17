import { Resend } from "resend";
 
export async function onRequestPost(context) {
const formData = await context.request.formData();
 
const resend = new Resend(context.env.RESEND_API_KEY);
 
const name = formData.get("Name");
const email = formData.get("Email");
const dogName = formData.get("Dog Name");
const breed = formData.get("Breed");
const age = formData.get("Age");
const concern = formData.get("Main Concern");
const goals = formData.get("Goals");
const additional = formData.get("Additional Information");
 
try {
await resend.emails.send({
from: "website@forthelovedog.com",
to: "clairefortheloveofdog@gmail.com",
subject: `New Consultation Request - ${name}`,
html: `
<h2>New Consultation Request</h2>
 
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Dog Name:</strong> ${dogName}</p>
<p><strong>Breed:</strong> ${breed}</p>
<p><strong>Age:</strong> ${age}</p>
<p><strong>Main Concern:</strong> ${concern}</p>
 
<h3>Goals</h3>
<p>${goals}</p>
 
<h3>Additional Information</h3>
<p>${additional}</p>
`
});
 
return Response.redirect(
new URL("/thank-you.html", context.request.url),
302
);
 
} catch (error) {
return new Response(
"There was an error submitting the form.",
{ status: 500 }
);
}
}
