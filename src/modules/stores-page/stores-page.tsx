import "../../styles/admin-page-layout.css";

import { NavLink } from "react-router";
import Typography from "../../components/typography/typography";
import CustomButton from "../../components/custom-button/custom-button";
import CustomForm from "../../components/custom-form/custom-form";
import useStoresPageController from "./use-stores-page-controller";
import { emptyStoreValues, StoreSchema, storeInputFields } from "./store-form-config";
import { errorMessage } from "../../utility/validation";

const StoresPage = () => {
    const {
        stores,
        isLoading,
        isError,
        error,
        isAdding,
        isSaving,
        setIsAdding,
        handleAddStore,
    } = useStoresPageController();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-page-header-text">
                    <Typography variant="headline" size="medium" weight="emphasis">Stores</Typography>
                    <Typography variant="body" size="medium" color="secondary">
                        Locations that belong to your organisation.
                    </Typography>
                </div>
                {!isAdding &&
                    <CustomButton size="medium" onClick={() => setIsAdding(true)}>Add store</CustomButton>}
            </div>

            {isAdding &&
                <section className="admin-page-card">
                    <Typography variant="title" size="medium" weight="emphasis">New store</Typography>
                    <CustomForm
                        key="addStoreCustomForm"
                        formName="addStoreCustomForm"
                        initialValues={emptyStoreValues}
                        validationSchema={StoreSchema}
                        inputFields={storeInputFields}
                        disabled={isSaving}
                        onSubmit={handleAddStore}
                    />
                    <div className="admin-page-card-actions">
                        <CustomButton variant="text" onClick={() => setIsAdding(false)}>Cancel</CustomButton>
                        <CustomButton size="medium" type="submit" form="addStoreCustomForm" disabled={isSaving}>
                            {isSaving ? "Saving…" : "Save store"}
                        </CustomButton>
                    </div>
                </section>
            }

            {isLoading && <Typography variant="body" color="secondary">Loading stores…</Typography>}

            {isError &&
                <Typography variant="body" color="error">{errorMessage(error, "Could not load stores.")}</Typography>}

            {!isLoading && !isError && stores.length === 0 &&
                <div className="admin-page-empty">
                    <Typography variant="body" color="secondary">No stores yet. Add your first location.</Typography>
                </div>
            }

            {stores.length > 0 &&
                <div className="admin-page-grid">
                    {stores.map(store => (
                        <NavLink key={store.id} to={`/stores/${store.id}/details`} className="admin-page-card stores-page-card-link">
                            <Typography variant="title" size="medium" weight="emphasis">{store.storeName}</Typography>
                            <div>
                                <Typography variant="body" size="small" color="secondary">{store.address}</Typography>
                                <Typography variant="body" size="small" color="secondary">Manager: {store.storeManager}</Typography>
                                <Typography variant="body" size="small" color="secondary">{store.phoneNumber}</Typography>
                            </div>
                        </NavLink>
                    ))}
                </div>
            }
        </div>
    );
};

export default StoresPage;
