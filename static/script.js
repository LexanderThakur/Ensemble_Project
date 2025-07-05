const apiBase="/"


function convertTreeToD3Format(node) {
  if (node.is_leaf) return node;

  return {
    ...node,
    children: [convertTreeToD3Format(node.left), convertTreeToD3Format(node.right)]
  };
}


function drawD3Tree(treeData) {
  document.getElementById("tree-svg").innerHTML = ""; // clear previous

  const svg = d3.select("#tree-svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  const g = svg.append("g").attr("transform", "translate(50,50)");

  const formattedTree = convertTreeToD3Format(treeData);
  const root = d3.hierarchy(formattedTree);
  //const treeLayout = d3.tree().size([width - 100, height - 100]);
  const treeLayout = d3.tree().size([1200, 400]);  // wider spacing

  // const treeLayout = d3.tree().size([width - 100, height - 100]);
  treeLayout(root);

  // Draw links
  g.selectAll(".link")
    .data(root.links())
    .enter().append("line")
    .attr("class", "link")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#999");

  // ✅ FIX: Add this block back to define "node"
  const node = g.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  // Draw circles
  node.append("circle")
  .attr("r", 48)
  .attr("fill", d => d.data.is_leaf ? "#ffffff" : "#000000")  // white for leaf, black for decision
  .attr("stroke", "#333");

// Text styling
node.append("text")
  .attr("text-anchor", "middle")
  .attr("font-size", 14)
  .attr("font-weight", "bold")
  .attr("y", function(d) {
    const lines = d.data.is_leaf ? 3 : 2;
    return -((lines - 1) * 10); // Adjust vertical shift based on number of lines
  })
  .selectAll("tspan")
  .data(d => {
    const isLeaf = d.data.is_leaf;
    const textColor = isLeaf ? "#000000" : "#ffffff";
    const lines = isLeaf
      ? [`Leaf`, `Value: ${d.data.value.toFixed(2)}`, `MSE: ${d.data.mse.toFixed(2)}`]
      : [`F${d.data.feature} ≤ ${d.data.threshold.toFixed(2)}`, `MSE: ${d.data.mse.toFixed(2)}`];
    return lines.map((line, i) => ({ line, textColor, i }));
  })
  .enter()
  .append("tspan")
  .attr("x", 0)
  .attr("dy", "1.2em")
  .attr("fill", d => d.textColor)
  .text(d => d.line);





}



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

    drawD3Tree(tree)


    console.log(tree)





   }
   catch(err){
    console.log("Error fetching data:", err.message);
   }



}