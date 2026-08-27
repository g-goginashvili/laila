import "./modal.css"

const Modal = ({
    children
}: { children: React.ReactNode }) => {
    return (
        <div className="modal-screen">
            <div className="modal-popup">
                <div className="modal-decorative-line" />
                {children}
            </div>
        </div>
    );
};

export default Modal;