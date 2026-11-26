---
title: An Important Announcement Regarding the Future of Zepp OS Screen Reader (ZSR)
date: 2026-11-19T10:30:00
preview: The NVC Development Team explains why it is looking to transfer the ZSR project codebase to a capable third party, and shares the terms for anyone interested.
---

Dear ZSR Users, Fellow Developers, and Friends of the Community,

When we — a group of young blind developers at the **NVC Development Team** — started building **Zepp OS Screen Reader (ZSR)**, we were driven by a simple conviction: _"Accessibility is not a feature, it's a human right."_ Wearables have become central to health tracking, communication, and daily convenience, yet almost none of them were usable without sight. We wanted ZSR to be more than an app—to serve as _"a bridge to digital independence for the visually impaired community."_

With the support of our users and open-source community, ZSR grew from an ambitious idea into a published application on the **Zepp App Store** and an open-source codebase on GitHub. Together, we built:

- **Dual Text-to-Speech Support:** High-quality natural voices via OpenAI GPT-4o through Zepp Flow™ (Zepp OS 3.5+) alongside an offline eSpeak-NG fallback (Zepp OS 2.0–3.4).
- **Core Accessibility Features:** Screen Explore Mode (touch-to-read), customizable single- and multi-finger gestures, voice control, vibration Braille output and BLE Braille display compatibility, real-time notification reading, and verbal health sensor readouts (heart rate, SpO2).
- **Multi-Device Reach & Full Stack:** Support targeting Zepp OS 2.0+ devices—including Amazfit Bip 6, T-Rex 2 & Ultra, GTR 4, GTR Mini, GTS 4, Balance, Cheetah Pro, and Falcon—along with companion phone-side services (`app-side`), the `GrantPermission` watch-to-phone bridge, auxiliary server code (`server/`), and this WCAG 2.2 Level AA website (`zeppreader.com`).

Today, however, I must share a painful and difficult decision with everyone who has trusted, tested, and stood behind us. After long and careful consideration, **we are looking to sell and transfer the Zepp OS Screen Reader (ZSR) project codebase to a capable third party** who can sustain, improve, and carry our mission forward.

## Sharing Our Realities and Challenges With the Community

We owe complete honesty to our users and fellow developers about why we have reached this crossroads, and we sincerely ask for your understanding and compassion:

1. **Changes Within the NVC Development Team:**  
   Other members of the **NVC Development Team** have had to step away due to personal commitments and their own work obligations. Maintaining the **zeppreader.com** website alone is not enough to sustain an entire living smartwatch accessibility ecosystem.
2. **Limited Financial and Technical Resources:**  
   As an independent, community-driven effort, our financial, economic, and technical resources are strictly limited. Without sustained funding and engineering capacity, I cannot keep ZSR maintained and compatible with future Zepp OS releases over the long term. Rather than letting ZSR slowly break or fade away, transferring the project to a third party with stronger resources is the most responsible decision we can make.
3. **Insurmountable Accessibility Barriers in Hardware Testing and Debugging:**  
   As we noted in our own documentation, testing ZSR on physical smartwatches is essential because touch latency, TTS timing, and accessibility APIs do not always match the simulator. However, as a blind lead developer, I face real technical walls that I cannot overcome alone: screen readers such as **NVDA** cannot read the local Zepp OS simulator (`zeus dev`), and I cannot read console logs directly on the watch screen (or visually inspect every subtle UI/log state across physical hardware). As a result, it has become extremely difficult to control every detail or guarantee bug-free installations across all watch models. ZSR needs a developer or organization with full visual and technical access to debug, test, and elevate the software reliably.

## Information for Interested Third Parties (Terms of Sale & Ownership)

For organizations, teams, or individuals interested in acquiring and advancing the ZSR project, please carefully review the following terms:

- **Scope of Sale (Codebase Only):**  
  This sale covers **the ZSR project source code only** (including the Zepp OS watch app, companion `app-side` logic, permission bridge, auxiliary server services, and the Svelte-based website source). Personal or team GitHub accounts (`NVCDevelopmentTeam`) and original copyright ownership are **not** included in the sale.
- **Preserving Original Attribution:**  
  Out of respect for the team that built ZSR from day one, the buyer **must retain the names and credits of the original NVC Development Team** within the project.
- **MIT License & Author Consent:**  
  ZSR is distributed under the **MIT License**, and as explicitly stated in our repository documentation, organizations or individuals wishing to integrate or operate this project commercially must obtain the author's written consent first. Official transfer and ownership of the ZSR project require direct agreement with me as the lead author.
- **Initial Investment & Private Pricing Discussion:**  
  To launch and sustain the project's presence, I personally invested an initial **$200 USD** out-of-pocket covering domain registration, web hosting, and the time and effort required to build and maintain **zeppreader.com**. The price for the project is not listed publicly and will be discussed and negotiated privately via email between both parties.

## A Heartfelt Hope for What Comes Next

To the blind and low-vision users who rely on ZSR, and to the developers who have cheered us on: we know transitions like this are never easy to hear. Please know that this choice comes not from a lack of love for ZSR, but from our desire to see it survive and grow beyond what one person can carry alone.

Even as ZSR seeks a new home with a third party, our core wish remains unchanged—to make wearable technology truly inclusive so everyone can stay connected and monitor their health independently. We sincerely hope that you will understand our difficult decision, and that you will continue to **trust, support, and walk alongside ZSR** in its next chapter under a capable third-party maintainer.

## Contact for Inquiries

If you are interested in purchasing the ZSR project codebase or discussing transfer details, please contact me directly via the official email attached on this website:

- **Email:** [contact@zeppreader.com](mailto:contact@zeppreader.com)
- **Alternatively, you can leave your information on the [Contact](https://www.zeppreader.com/contact/) page and we will contact you as soon as possible.**

Thank you sincerely for every bug report, kind word, and moment of support you have given to the NVC Development Team.

Hopefully everyone will continue to support the project and have fun.
