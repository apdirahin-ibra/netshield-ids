export default function LoadingState({ label = "Loading data" }) {
  return <div className="loading-state" role="status"><span className="spinner" />{label}<span className="sr-only">Please wait</span></div>;
}
