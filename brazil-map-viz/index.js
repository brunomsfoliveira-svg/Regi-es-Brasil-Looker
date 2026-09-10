class BrazilRegionMap extends dscc.BaseViz {
  constructor() {
    super();
    this.svgNS = "http://www.w3.org/2000/svg";
  }

  createVizDom(container) {
    this.svg = document.createElementNS(this.svgNS, "svg");
    this.svg.setAttribute("viewBox", "0 0 500 500");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    container.appendChild(this.svg);

    this.regions = {};
    this.tooltip = document.createElement("div");
    this.tooltip.style.cssText = "position:absolute;background:#fff;border:1px solid #ccc;padding:5px 8px;font-size:12px;pointer-events:none;display:none;z-index:10;";
    container.appendChild(this.tooltip);
  }

  drawViz(data) {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this.regions = {};

    const config = this.getConfig();
    const dimId = config.data[0].fields[0].id;
    const metId = config.data[0].fields[1].id;

    const values = {};
    let min = Infinity, max = -Infinity;

    data.forEach(row => {
      const region = row[dimId].value;
      const value = row[metId].value;
      values[region] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    });

    const minColor = config.style.colorScale[0].value;
    const maxColor = config.style.colorScale[1].value;

    const paths = {
      "Norte": "M 130 60 L 200 50 L 240 70 L 260 100 L 250 130 L 220 150 L 180 160 L 140 150 L 110 130 L 100 100 L 110 70 Z",
      "Nordeste": "M 260 100 L 320 90 L 380 100 L 420 120 L 430 150 L 410 180 L 380 200 L 340 210 L 300 200 L 270 180 L 250 150 L 250 130 Z",
      "Centro-Oeste": "M 140 150 L 220 150 L 250 180 L 260 220 L 240 260 L 200 270 L 160 250 L 140 220 L 130 180 Z",
      "Sudeste": "M 240 260 L 300 250 L 340 270 L 350 300 L 330 330 L 290 340 L 250 320 L 230 290 Z",
      "Sul": "M 230 320 L 290 340 L 300 380 L 280 420 L 250 440 L 220 420 L 210 380 L 220 340 Z"
    };

    Object.keys(paths).forEach(name => {
      const path = document.createElementNS(this.svgNS, "path");
      path.setAttribute("d", paths[name]);
      path.setAttribute("stroke", "#333");
      path.setAttribute("stroke-width", "1");

      const val = values[name] || 0;
      const ratio = max === min ? 0.5 : (val - min) / (max - min);
      path.setAttribute("fill", this.interpolateColor(minColor, maxColor, ratio));

      path.addEventListener("mousemove", (e) => {
        this.tooltip.style.display = "block";
        this.tooltip.style.left = (e.pageX + 10) + "px";
        this.tooltip.style.top = (e.pageY + 10) + "px";
        this.tooltip.innerHTML = `<b>${name}</b><br/>${val}`;
      });
      path.addEventListener("mouseleave", () => {
        this.tooltip.style.display = "none";
      });

      this.svg.appendChild(path);
      this.regions[name] = path;
    });
  }

  interpolateColor(c1, c2, ratio) {
    const hex = c => parseInt(c.slice(1), 16);
    const v1 = hex(c1), v2 = hex(c2);
    const r = Math.round(((v1 >> 16) & 255) * (1 - ratio) + ((v2 >> 16) & 255) * ratio);
    const g = Math.round(((v1 >> 8) & 255) * (1 - ratio) + ((v2 >> 8) & 255) * ratio);
    const b = Math.round((v1 & 255) * (1 - ratio) + (v2 & 255) * ratio);
    return `rgb(${r},${g},${b})`;
  }
}

dscc.registerComponent("brazil-region-map", BrazilRegionMap);