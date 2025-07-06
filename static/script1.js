const apiBase = "/";

function setLoadingState(isLoading) {
  const buttons = document.querySelectorAll("button[type='submit']");
  buttons.forEach(button => {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = "Loading...";
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  });
}


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
  setLoadingState(true);
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
  finally{
    setLoadingState(false);
  }
}



async function BagGen(event) {
  event.preventDefault();

  const n_samples = document.getElementById("bag-samples-slider").value;
  const max_depth = document.getElementById("bag-depth-slider").value;
  const n_trees = document.getElementById("bag-tree-slider").value;
  setLoadingState(true);
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
    Plotly.newPlot("bagging-tree-container", result.data, result.layout);

  } catch (err) {
    console.log("Error:", err.message);
  }
  finally{
    setLoadingState(false);
  }
}

let boostingTrees = [];
let boostingIndex = 0;



async function BoostGen(event) {
  event.preventDefault();

  const n_samples = document.getElementById("boost-samples-slider").value;
  const max_depth = document.getElementById("boost-depth-slider").value;
  const n_trees = document.getElementById("boost-tree-slider").value;
  const lr = document.getElementById("boost-lr-slider").value;
  setLoadingState(true);
  try {
    const response = await fetch("/BoostTree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        n_samples: n_samples,
        max_depth: max_depth,
        n_trees: n_trees,
        lr: lr
      })
    });

    const data = await response.json();
    boostingTrees = data.trees;
    boostingIndex = 0;

    document.getElementById("next-boost-tree").style.display = "inline-block";
    document.getElementById("next-boost-tree").disabled = false;
    document.getElementById("next-boost-tree").textContent = "Next Tree →";

    showNextBoostingTree();  // show the first tree

  } catch (err) {
    console.error("Boosting error:", err);
  }
  finally{
    setLoadingState(false);
  }
}

function showNextBoostingTree() {
  if (boostingTrees.length === 0) return;

  const currentTree = boostingTrees[boostingIndex];
  Plotly.newPlot("boosting-tree-container", currentTree.data, currentTree.layout);

  document.getElementById("boost-tree-number").textContent =
    `Tree ${boostingIndex + 1} of ${boostingTrees.length}`;

  boostingIndex++;

  if (boostingIndex >= boostingTrees.length) {
    document.getElementById("next-boost-tree").disabled = true;
    document.getElementById("next-boost-tree").textContent = "Completed";
  }
}

