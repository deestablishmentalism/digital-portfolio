const API_URL = "https://psgc.gitlab.io/api/"
async function fetchList(url) {
    const response = await fetch(`${API_URL}${url}`);
    if (!response.ok) throw new Error("ERR: " + response.status);
    const data = await response.json();
    if (!data.length) throw new Error("Empty");
    return data;
}
export const fetchRegions = () => fetchList("regions/");
export const fetchProvinces = (regionCode) => fetchList(`regions/${regionCode}/provinces/`);
export const fetchCities = (provinceCode) => fetchList(`provinces/${provinceCode}/cities-municipalities/`);
export const fetchBarangays = (cityCode) => fetchList(`cities-municipalities/${cityCode}/barangays/`);
