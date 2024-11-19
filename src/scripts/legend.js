export function addLegend(map) {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.backgroundColor = "white";
    div.style.padding = "10px";

    const grades = [0, 5, 10, 15, 20, 25, 30, 35, 40];
    const colors = [
      "#003366",
      "#336699",
      "#6699CC",
      "#99CCFF",
      "#99FFFF",
      "#CCFFFF",
      "#FFFFCC",
      "#FFFF99",
      "#FFFF33",
    ];

    grades.forEach((grade, i) => {
      div.innerHTML += `
        <i style="background:${colors[i]}; width: 20px; height: 15px; display: inline-block;"></i>
        ${grade}${grades[i + 1] ? `&ndash;${grades[i + 1]}` : "+"}<br>
      `;
    });

    return div;
  };

  legend.addTo(map);
}
