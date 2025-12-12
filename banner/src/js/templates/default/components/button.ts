import { ButtonTypes } from "@/js/types";

export default (label: string, id: ButtonTypes): string => {
    return `<button class="button" id="${id}" tabindex="0">${label}</button>`;
};
