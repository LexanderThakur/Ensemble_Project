const apiBase="/"

let nodeId = 0;

function renderTree(tree, container, depth = 0, x = 600, spacing = 300) {
  const nodeDiv = document.createElement("div");
  nodeDiv.className = "tree-node";

  // Auto Positioning
  const top = depth * 150;
  const left = x;
  nodeDiv.style.top = `${top}px`;
  nodeDiv.style.left = `${left}px`;

  // Content
  if (tree.is_leaf) {
    nodeDiv.innerHTML = `Leaf<br>Val: ${tree.value.toFixed(1)}<br>MSE: ${tree.mse.toFixed(1)}`;
  } else {
    nodeDiv.innerHTML = `F${tree.feature} ≤ ${tree.threshold.toFixed(1)}<br>MSE: ${tree.mse.toFixed(1)}`;
  }

  container.appendChild(nodeDiv);

  // Recurse
  if (!tree.is_leaf) {
    const offset = spacing / 2;
    renderTree(tree.left, container, depth + 1, x - offset, offset);
    renderTree(tree.right, container, depth + 1, x + offset, offset);
  }
}


// Dummy tree example
const tree = {
  is_leaf: false,
  feature: 1,
  threshold: 3.5,
  mse: 40.0,
  left: {
    is_leaf: false,
    feature: 0,
    threshold: 2.1,
    mse: 20.0,
    left: { is_leaf: true, value: 10.0, mse: 3.0 },
    right: { is_leaf: true, value: 15.0, mse: 2.0 }
  },
  right: {
    is_leaf: true,
    value: 30.0,
    mse: 5.0
  }
};


// On load
window.onload = function () {
  const container = document.getElementById("tree-container");
  container.innerHTML = ""; // Clear
  renderTree(tree, container);
};




async function RegGen(event){
   event.preventDefault();
   const n_samples=document.getElementById("samples-slider").value
   const max_depth=document.getElementById("depth-slider").value


   try{


    const response= await fetch(apiBase+'RegTree',{
        method :"POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify({
            n_samples:n_samples,
            max_depth:max_depth,
            tree_type:1



        })


    })

    const tree= await response.json()

    const container = document.getElementById("tree-container");
    container.innerHTML = "";  // Clear previous
    renderTree(tree, container);



    console.log(tree)





   }
   catch(err){
    console.log("Error fetching data:", err.message);
   }



}