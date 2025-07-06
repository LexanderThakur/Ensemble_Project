const apiBase = "/";

function generateTable(X, y) {
  let html = "<table><thead><tr><th>Index</th><th>X[0]</th><th>X[1]</th><th>y</th></tr></thead><tbody>";

  for (let i = 0; i < X.length; i++) {
    html += `<tr>
      <td>${i + 1}</td>
      <td>${X[i][0].toFixed(2)}</td>
      <td>${X[i][1].toFixed(2)}</td>
      <td>${y[i].toFixed(2)}</td>
    </tr>`;
  }

  html += "</tbody></table>";
  return html;
}
async function RegGen(event) {
  event.preventDefault();

  // Ensure the regression section is visible
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active-section"));

  document.querySelector(".nav-item[data-target='regression-section']").classList.add("active");
  document.getElementById("regression-section").classList.add("active-section");

  const n_samples = document.getElementById("samples-slider").value;
  const max_depth = document.getElementById("depth-slider").value;

  try {
    const response = await fetch(apiBase + "RegTree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        n_samples: n_samples,
        max_depth: max_depth,
        tree_type: 1
      })
    });

    const tree = await response.json();

    Plotly.newPlot("tree-container", tree.data, tree.layout);
    document.getElementById("tree-data").innerHTML = generateTable(tree.X, tree.y);

  } catch (err) {
    console.log("Error fetching data:", err.message);
  }
}



let baggingTrees = []; // Global array to store all trees

async function BagGen(event) {
  event.preventDefault();

  const n_samples = document.getElementById("bag-samples-slider").value;
  const max_depth = document.getElementById("bag-depth-slider").value;
  const n_trees = document.getElementById("bag-tree-slider").value;

  try {
    const response = await fetch("/BagTree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        n_samples: n_samples,
        max_depth: max_depth,
        n_trees: n_trees
      })
    });

    const result = await response.json();
    baggingTrees = result.trees;

    const selector = document.getElementById("tree-selector");
    selector.innerHTML = "";

    baggingTrees.forEach((tree, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.text = tree.title || `Tree ${i + 1}`;
      selector.appendChild(option);
    });

    updateBaggingPlot(); // Show first tree initially

  } catch (err) {
    console.log("Error:", err.message);
  }
}

function updateBaggingPlot() {
  const selectedIndex = document.getElementById("tree-selector").value;
  const tree = baggingTrees[selectedIndex];

  Plotly.newPlot("bagging-tree-container", tree.data, tree.layout);
}
