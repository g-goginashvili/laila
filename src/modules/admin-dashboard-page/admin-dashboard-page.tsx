import "../../styles/admin-page-layout.css";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import Typography from "../../components/typography/typography";
import CustomButton from "../../components/custom-button/custom-button";
import useAuth from "../../hooks/use-auth";
import { queryKeys } from "../../api/query-keys";
import { getOrganisationDetails } from "../../api/organisations-api";
import { getStoresList } from "../../api/stores-api";

const AdminDashboardPage = () => {
    const user = useAuth((state) => state.user);
    const navigate = useNavigate();

    const { data: organisation } = useQuery({
        queryKey: queryKeys.organisation(user?.uid),
        queryFn: getOrganisationDetails,
        enabled: !!user
    });

    const { data: stores = [] } = useQuery({
        queryKey: queryKeys.stores(user?.uid),
        queryFn: getStoresList,
        enabled: !!user
    });

    return (
        <div className="admin-page">
            <div className="admin-page-header-text">
                <Typography variant="headline" size="medium" weight="emphasis">
                    Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
                </Typography>
                <Typography variant="body" size="medium" color="secondary">{organisation?.orgName}</Typography>
            </div>

            <div className="admin-page-grid">
                <section className="admin-page-card admin-page-stat">
                    <Typography variant="label" color="secondary">Stores</Typography>
                    <Typography variant="display" size="small" weight="emphasis">{stores.length}</Typography>
                </section>
                <section className="admin-page-card admin-page-stat">
                    <Typography variant="label" color="secondary">Organisation type</Typography>
                    <Typography variant="title" size="medium" weight="emphasis">
                        {organisation ? (organisation.singleLocation ? "Single location" : "Multiple locations") : "—"}
                    </Typography>
                </section>
                <section className="admin-page-card admin-page-stat">
                    <Typography variant="label" color="secondary">Address</Typography>
                    <Typography variant="body" size="medium">{organisation?.address ?? "—"}</Typography>
                </section>
            </div>

            <div>
                <CustomButton size="medium" variant="outlined" onClick={() => navigate("/stores")}>Manage stores</CustomButton>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
