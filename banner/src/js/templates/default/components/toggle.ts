export const toggle = (type: string, toggleable: boolean = true, isChecked: boolean = true): string => {
    const checkbox = `<input type="checkbox" hidden ${isChecked ? "checked" : ""} value="${type}" class="consent-type-value" id="toggle-${type}" />`;
    const classes = toggleable ? "toggle toggleable" : "toggle-switch not-toggleable";

    return `
    <div class="${classes}" ${toggleable ? `tabindex="0"` : ``} role="button">
            ${toggleable ? checkbox : ""}
        <div class="track"></div>
        <div class="thumb"></div>
    </div>

    `;
};
