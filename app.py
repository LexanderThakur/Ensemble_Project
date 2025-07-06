from flask import Flask,request,jsonify,render_template

from trees.RegressionTree import build_tree
import json
import numpy as np
import plotly.io as pio


import plotly.graph_objects as go

def layout_tree(tree, x=0, y=0, dx=1.5, dy=-100, nodes=None, edges=None, parent=None):
    if nodes is None: nodes = []
    if edges is None: edges = []
    label = (
    f"MSE: {tree['mse']:.2f}<br>Value: {tree['value']:.2f}" if tree["is_leaf"]
    else f"MSE: {tree['mse']:.2f}<br>X[{tree['feature']}] ≤ {tree['threshold']:.2f}"
)


    # label = f"MSE: {tree['mse']:.2f}" if tree["is_leaf"] else f"X[{tree['feature']}] ≤ {tree['threshold']:.2f}"
    node_id = len(nodes)
    nodes.append(dict(x=x, y=y, label=label))

    if parent is not None:
        edges.append(dict(from_id=parent, to_id=node_id))

    if not tree["is_leaf"]:
        left_x = x - dx / (2 ** tree["depth"])
        right_x = x + dx / (2 ** tree["depth"])
        layout_tree(tree["left"], x=left_x, y=y + dy, dx=dx, dy=dy, nodes=nodes, edges=edges, parent=node_id)
        layout_tree(tree["right"], x=right_x, y=y + dy, dx=dx, dy=dy, nodes=nodes, edges=edges, parent=node_id)

    return nodes, edges


def build_plotly_tree(tree):
    nodes, edges = layout_tree(tree)

    node_trace = go.Scatter(
        x=[n['x'] for n in nodes],
        y=[n['y'] for n in nodes],
        text=[n['label'] for n in nodes],
        mode='markers+text',
        textposition="top center",
        marker=dict(size=40, color='white', line=dict(width=1, color='Black')),
        hoverinfo='text'
    )

    edge_traces = []
    for edge in edges:
        from_node = nodes[edge["from_id"]]
        to_node = nodes[edge["to_id"]]
        edge_traces.append(
            go.Scatter(
                x=[from_node["x"], to_node["x"]],
                y=[from_node["y"], to_node["y"]],
                mode="lines",
                line=dict(width=2, color="gray"),
                hoverinfo="none"
            )
        )

    fig = go.Figure(data=[node_trace] + edge_traces)
    fig.update_layout(
        showlegend=False,
        margin=dict(l=0, r=0, t=0, b=0),
        xaxis=dict(showgrid=False, zeroline=False, visible=False),
        yaxis=dict(showgrid=False, zeroline=False, visible=False),
        height=800
    )

    return fig

def generate_linear_data(n_samples=50,noise=0.1):
    X=np.random.rand(n_samples,2)*10
    y= 3*X[:,0] + 2 *X[:,1] +np.random.randn(n_samples) * noise

    return X,y


app=Flask(__name__)


@app.route('/',methods=['GET'])
def page():
    return render_template("index.html")

@app.route('/RegTree',methods=['POST'])
def generate():
    data=request.get_json()
    #1 for reg tree ,2 for bagg,3 for random ,4 for boost

    tree_type=int(data.get('tree_type',1))
    n_samples=int(data.get('n_samples',10))
    max_depth=int(data.get('max_depth',3))

    X,y=generate_linear_data(n_samples)

    tree=build_tree(X,y,max_depth=max_depth)
    fig = build_plotly_tree(tree)
    fig_json = json.loads(pio.to_json(fig))

    fig_json['X'] = X.tolist()
    fig_json['y'] = y.tolist()
    return jsonify(fig_json)


    

    
    





if __name__ == "__main__":
    app.run(debug=True)