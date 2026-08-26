type ChevronProps = {
    facing?: "left" | "right" | "up" | "down";
};

const Chevron = ({
    facing = "left"
}: ChevronProps) => {

    const rotation = {
        left: 0,
        up: 90,
        right: 180,
        down: 270,
    }[facing];

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
        </svg>
    );
};

export default Chevron;