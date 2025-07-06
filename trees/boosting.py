import numpy as np



def mse(y):
    mean = np.mean(y)
    return np.mean((y - mean) ** 2)

def bootstrap_sample(X, y):
    n_samples = len(X)
    indices = np.random.choice(n_samples, size=n_samples, replace=True)
    return X[indices], y[indices]


class Node:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

def best_split(X, y, feature_indices):
    best_feature = None
    best_threshold = None
    best_mse = float('inf')

    for feature in feature_indices:
        thresholds = np.unique(X[:, feature])
        for threshold in thresholds:
            left_mask = X[:, feature] <= threshold
            right_mask = X[:, feature] > threshold

            y_left = y[left_mask]
            y_right = y[right_mask]

            curr_mse = (len(y_left) * mse(y_left) + len(y_right) * mse(y_right)) / len(y)

            if curr_mse < best_mse:
                best_mse = curr_mse
                best_threshold = threshold
                best_feature = feature

    return best_feature, best_threshold

def build_tree_b(X, y, depth=0, maxdepth=3, min_samples=2, n_features_to_consider=None):
    if depth >= maxdepth or len(y) < min_samples:
        return {
      "is_leaf": True,
      "value": float(np.mean(y)),
      "depth": depth,
      "mse":float(mse(y))
    }

    n_total_features = X.shape[1]
    if n_features_to_consider is None:
        feature_indices = range(n_total_features)
    else:
        feature_indices = np.random.choice(n_total_features, n_features_to_consider, replace=False)

    feature, threshold = best_split(X, y, feature_indices)

    if feature is None or threshold is None:
        return {
      "is_leaf": True,
      "value": float(np.mean(y)),
      "depth": depth,
      "mse":float(mse(y))
    }

    left_mask = X[:, feature] <= threshold
    right_mask = X[:, feature] > threshold

    left = build_tree_b(X[left_mask], y[left_mask], depth + 1, maxdepth, min_samples, n_features_to_consider)
    right = build_tree_b(X[right_mask], y[right_mask], depth + 1, maxdepth, min_samples, n_features_to_consider)

    return {
    "is_leaf":False,
    "feature": int(feature),
    "threshold":float(threshold),
    "depth":depth,
    "left":left,
    "right": right,
    "mse":float(mse(y))
  }

def predict_sample(tree, x):
    if tree["is_leaf"]:
        return tree["value"]
    if x[tree["feature"]] <= tree["threshold"]:
        return predict_sample(tree["left"], x)
    else:
        return predict_sample(tree["right"], x)


def predict(tree, X):
    return np.array([predict_sample(tree, x) for x in X])


class GradientBoostingRegressor:
  def __init__(self,n_estimators=100,learning_rate=0.1,max_depth=2):
    self.n_estimators = n_estimators
    self.learning_rate = learning_rate
    self.max_depth = max_depth
    self.trees=[]
    self.initial_prediction=None

  def fit(self,X,y):
    self.trees=[]
    self.initial_prediction=np.mean(y)
    y_pred = np.full_like(y, self.initial_prediction, dtype=float)
    for _ in range(self.n_estimators):
      residuals=y-y_pred
      tree=build_tree_b(X,residuals,maxdepth=self.max_depth)
      self.trees.append(tree)
      update=predict(tree,X)
      y_pred+= self.learning_rate *update

  def predict(self,X):
    y_pred=np.full(X.shape[0],self.initial_prediction,dtype=float)
    for tree in self.trees:
      y_pred += self.learning_rate * predict(tree, X)
    return y_pred


