from flask import Flask,request,jsonify,render_template

from trees.RegressionTree import build_tree
import json
import numpy as np


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
    return jsonify(tree)  

    
    





if __name__ == "__main__":
    app.run(debug=True)