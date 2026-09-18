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
 
return new Response(`
<!DOCTYPE html>
<html>
<head>
<title>Thank You</title>
<style>
body{
font-family:Arial,sans-serif;
background:#fffdf8;
color:#243233;
text-align:center;
padding:60px 20px;
}
 
.box{
max-width:700px;
margin:auto;
background:#eaf6f5;
padding:40px;
border-radius:15px;
border-left:6px solid #0a7479;
}
 
a{
display:inline-block;
margin-top:20px;
padding:12px 24px;
background:#0a7479;
color:white;
text-decoration:none;
border-radius:25px;
}
</style>
</head>
<body>
 
<div class="box">
<h1>Test Success Page</h1>
 
<p>
Your consultation request has been submitted successfully.
</p>
 
<p>
I'll review your information and get back to you as soon as possible.
</p>
 
/Return Home</a>
 
</div>
 
</body>
</html>
`, {
headers: {
"Content-Type": "text/html"
}
});
}
