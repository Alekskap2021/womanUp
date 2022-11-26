import { createPortal } from "react-dom";

const ChangingModalPortal = (props) => {
  const node = document.createElement(`div`);
  node.classList.add("modal");
  document.body.appendChild(node);

  return createPortal(props.children, node);
};

export default ChangingModalPortal;
