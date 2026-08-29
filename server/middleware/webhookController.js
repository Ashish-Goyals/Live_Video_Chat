import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;
    const data = evt.data;

    switch (eventType) {
      case "user.created": {
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name || ""}`.trim();
        const image = data.image_url || "";
        const plan = "free";

        await sql`
        INSERT INTO users (id, email, name, image, plan)
        VALUES (${userId}, ${primaryEmail}, ${name}, ${image}, ${plan})
        ON CONFLICT (id) DO UPDATE SET
        id = EXCLUDED.id,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        plan = EXCLUDED.plan,
        updated_at = NOW()`;
        break;
      }

      case "user.updated": {
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name || ""}`.trim();
        const image = data.image_url || "";

        await sql`
        INSERT INTO users (id, email, name, image)
        VALUES (${userId}, ${primaryEmail}, ${name}, ${image})
        ON CONFLICT (id) DO UPDATE SET
        id = EXCLUDED.id,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        updated_at = NOW()`;
        break;
      }
      case "user.deleted": {
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    return res.status(200).json({ success: true, eventType });
  } catch (error) {
    console.error("Error verifying Clerk Webhook:", error.message || error);
    return res.status(500).json({
      error: "Webhook verification failed" + (error.message || error),
    });
  }
};
