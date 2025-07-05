import plotly.graph_objects as go

tree = {
    "is_leaf": False,
    "feature": 0,
    "threshold": 3.5,
    "mse": 25.3,
    "left": {
        "is_leaf": True,
        "value": 10.1,
        "mse": 5.2
    },
    "right": {
        "is_leaf": False,
        "feature": 1,
        "threshold": 1.2,
        "mse": 10.0,
        "left": {
            "is_leaf": True,
            "value": 20.2,
            "mse": 3.1
        },
        "right": {
            "is_leaf": True,
            "value": 30.3,
            "mse": 2.2
        }
    }
}

positions = []
lines = []

def traverse_tree(tree, x, y, depth=0, parent=None):
    if tree["is_leaf"]:
        label = f"Leaf<br>Val: {tree['value']:.1f}<br>MSE: {tree['mse']:.1f}"
    else:
        label = f"F{tree['feature']} ≤ {tree['threshold']:.1f}<br>MSE: {tree['mse']:.1f}"

    positions.append((x, y, label))
    if parent:
        lines.append((parent, (x, y)))

    if not tree["is_leaf"]:
        offset = 150 / (depth + 1)
        traverse_tree(tree["left"], x - offset, y - 100, depth + 1, (x, y))
        traverse_tree(tree["right"], x + offset, y - 100, depth + 1, (x, y))

traverse_tree(tree, 0, 0)

fig = go.Figure()

fig.add_trace(go.Scatter(
    x=[p[0] for p in positions],
    y=[p[1] for p in positions],
    text=[p[2] for p in positions],
    mode="markers+text",
    textposition="middle center",
    marker=dict(size=40, color="lightblue", line=dict(color="black", width=2))
))

for (x0, y0), (x1, y1) in lines:
    fig.add_shape(type="line", x0=x0, y0=y0, x1=x1, y1=y1,
                  line=dict(color="black", width=2))

fig.update_layout(
    width=800,
    height=600,
    showlegend=False,
    xaxis=dict(visible=False),
    yaxis=dict(visible=False),
    plot_bgcolor='white',
    margin=dict(l=20, r=20, t=20, b=20)
)

fig.show()