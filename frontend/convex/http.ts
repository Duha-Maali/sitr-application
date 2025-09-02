// this event called whenever user signin
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/clerk-webhook", // extension of Webhook URL you have created
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Make sure that Webhook is comming from clerk
    // Check of the env. variable
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }
    // Check headers
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");
    if (!svix_id || !svix_signature || !svix_timestamp)
      return new Response("Error occurred -- no svix headers", { status: 400 });

    // Create a Webhook
    const payload = await request.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(webhookSecret);
    let event: any;

    // verify webhook
    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (error) {
      return new Response("Error occurred", { status: 400 });
    }

    // Check event
    const eventType = event.type;
    if (eventType === "user.created") {
      // extract user data
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const email = email_addresses[0].email_address; // select primary email for user's clerk emails
      // Save the user in the db
      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          userName: email.split("@")[0],
          image: image_url,
          clerkId: id,
        });
      } catch (err) {
        return new Response("Error creating user", { status: 500 });
      }
    }
    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
