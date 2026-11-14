import time
from backend.ibm_loader import IBMAMLDataLoader
from backend.ml_pipeline import LaunderGraphHybridEngine

t0 = time.time()
df, badge, meta = IBMAMLDataLoader().load_dataset()
engine = LaunderGraphHybridEngine()
results = engine.fit_and_evaluate(df)
print(f"Training & 3-Way Benchmark complete in {time.time()-t0:.2f}s!")
print("Models evaluated:", list(results["models"].keys()))
for m, vals in results["models"].items():
    print(f"  {m.upper():<20} | P: {vals['precision']*100:.1f}% | R: {vals['recall']*100:.1f}% | F1: {vals['f1']:.3f} | FPR: {vals['false_positive_rate']*100:.1f}%")
print("Lifts vs Baseline:", results["comparative_lift"])
print("Top Global Features:", results["top_global_features"][:3])

