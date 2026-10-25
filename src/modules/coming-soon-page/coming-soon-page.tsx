import "../../components/admin-ui/admin-ui.css";

const ComingSoonPage = ({
    title,
    description,
}: { title: string, description: string }) => {
    return (
        <main className="adm-page">
            <header className="adm-title-block">
                <h1 className="adm-h1">{title}</h1>
                <p className="adm-subtitle">Coming soon</p>
            </header>
            <div className="adm-card adm-card--padded">
                <span className="adm-chip adm-chip--info">In the works</span>
                <p className="adm-muted" style={{ margin: 0 }}>{description}</p>
            </div>
        </main>
    );
};

export default ComingSoonPage;
