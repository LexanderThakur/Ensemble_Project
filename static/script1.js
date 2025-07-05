const apiBase = "/";



async function RegGen(event) {
  event.preventDefault();

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


    
  } catch (err) {
    console.log("Error fetching data:", err.message);
  }
}
