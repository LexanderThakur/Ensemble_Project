import numpy as np


def mse(y):
  if len(y)==0:
    return 0

  mean=np.mean(y)
  return np.mean((y-mean)**2)

def best_split(X,y):
  best_feature=None
  best_threshold=None
  best_mse=float('inf')

  # number of columns
  n_features=X.shape[1]

  for feature in range(n_features):
    thresholds=np.unique(X[:,feature])
    for threshold in thresholds:
      left_mask= X[:,feature] <=threshold
      right_mask= X[:,feature] >threshold
      left_branch=y[left_mask]
      right_branch=y[right_mask]

      curr_mse=(len(left_branch)*mse(left_branch)+len(right_branch)*mse(right_branch))/len(y)

      if curr_mse < best_mse:
        best_mse=curr_mse
        best_threshold=threshold
        best_feature=feature
  return best_feature,best_threshold


class Node:
  def __init__(self,feature=None,threshold=None,left=None,right=None,value=None):
    self.feature=feature
    self.threshold=threshold
    self.left=left
    self.right=right
    self.value=value #only for leaf nodes




def build_tree(X,y,depth=0,max_depth=3,min_samples=2):
  if depth >= max_depth or len(y)<min_samples:
    return {
      "is_leaf":True,
      "value":float(np.mean(y)),
      "depth":depth
    }

  feature,threshold = best_split(X,y)
  if feature is None:
    return {
      "is_leaf": True,
      "value": float(np.mean(y)),
      "depth": depth
    }


  left_mask=X[:,feature] <=threshold
  right_mask=X[:,feature] > threshold

  left_branch= y[left_mask]
  right_branch= y[right_mask]

  left=build_tree(X[left_mask],left_branch,depth+1)
  right=build_tree(X[right_mask],right_branch,depth+1)

  return {
    "is_leaf":False,
    "feature": int(feature),
    "threshold":float(threshold),
    "depth":depth,
    "left":left,
    "right": right
  }



def predict_sample(node, x):
    if node["is_leaf"]:
        return node["value"]

    if x[node["feature"]] <= node["threshold"]:
        return predict_sample(node["left"], x)
    else:
        return predict_sample(node["right"], x)
    
    
def predict(tree, X):
    return np.array([predict_sample(tree, x) for x in X])



