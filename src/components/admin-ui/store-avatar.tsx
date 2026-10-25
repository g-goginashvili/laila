import "./admin-ui.css";

type StoreAvatarPropType = {
    name: string;
    // Store photo; until stores have one, the first two letters of the name are shown.
    imageUrl?: string | null;
    size?: "medium" | "large";
};

// First two letters of the name, skipping leading digits and symbols; Array.from keeps non-Latin letters whole.
const initialsOf = (name: string) =>
    Array.from(name.replace(/^[^\p{L}]+/u, "")).slice(0, 2).join("").toUpperCase() || "?";

// Round store badge shown next to a store's name.
const StoreAvatar = ({ name, imageUrl, size = "medium" }: StoreAvatarPropType) => (
    <span className={`adm-store-avatar adm-store-avatar--${size}`} aria-hidden="true">
        {imageUrl ? <img src={imageUrl} alt="" /> : initialsOf(name)}
    </span>
);

export default StoreAvatar;
