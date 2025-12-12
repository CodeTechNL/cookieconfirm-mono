function handler(event) {
    var res = event.response;
    var req = event.request;
    var h = req.headers || {};
    var c = h["cloudfront-viewer-country"] && h["cloudfront-viewer-country"].value ? h["cloudfront-viewer-country"].value : "ZZ";
    // zet landcode in response (twee headers, kies wat je wilt uitlezen)
    res.headers["cloudfront-viewer-country"] = { value: c };
    res.headers["x-viewer-country"] = { value: c };
    return res;
}
