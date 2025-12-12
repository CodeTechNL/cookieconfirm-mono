import { ccOnEvent } from "@/js/app/helpers";

class BannerService {
    register() {
        ccOnEvent("openBanner", () => {});
    }
}

export default BannerService;
