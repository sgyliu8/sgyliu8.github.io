# Workspace access update

The homepage Workspace already opens the protected `photometric-stereo-private` reader. Add the analytics card there, in its own `photometirc_stereo` repository, so visitor records remain behind owner authentication.

## Delivery

- Put Website analytics first in the Chinese and English workspace catalogues. Include map and visit-record anchors; existing search and recent-project controls discover the new card automatically.
- Remove the four decorative section numbers from the analytics dashboard and add a return-to-workspace link.
- Build the two workspace pages in isolation and overlay only their HTML and content-hashed assets on the current immutable R2 release. Preserve every existing research route. Merge the small source patch into the active workspace branch so future full publishes retain it.
- Verify language routing, search, recent navigation, mobile layout, anchor targets, and anonymous access denial. The analytics Worker continues checking the owner identity and application audience.

## Requested password wording: pending infrastructure

The existing sign-in form is hosted by Cloudflare Access. Its supported customization covers organization branding, header/footer and background; it does not expose an email-field label or an API for a replacement OTP form. Editing homepage HTML cannot change that cross-origin form. No cosmetic password gate or authentication bypass has been introduced.

The proposed flow is a custom sign-in screen with a fixed server-side recipient, a **Send one-time password** action and a **Password** field. The email address is never requested or exposed in the browser. The owner receives a short-lived, single-use code by email. This requires a configured transactional mail sender and an authentication integration; neither is present in this deployment. Cloudflare Email Service requires a domain on Cloudflare DNS. Do not put SMTP passwords, API credentials or a fixed password in source code or chat.

Before switching the live login, configure the sender, implement server-side challenge expiry and attempt limits, CSRF protection and secure sessions, test replay/wrong-code/rate-limit cases, and prove that Workspace, Polimi and analytics retain owner-only access. Keep the current Access protection active until the complete replacement has been verified. This is a separate authentication change, not part of the released UI patch.

References: [Access login-page customization](https://developers.cloudflare.com/cloudflare-one/reusable-components/custom-pages/access-login-page/), [Access one-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/), [Email Service setup](https://developers.cloudflare.com/email-service/get-started/send-emails/).
