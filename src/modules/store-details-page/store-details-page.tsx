import "../../styles/admin-page-layout.css";

import Typography from "../../components/typography/typography";
import CustomButton from "../../components/custom-button/custom-button";
import CustomForm from "../../components/custom-form/custom-form";
import useStoreDetailsPageController from "./use-store-details-page-controller";
import { StoreSchema, storeInputFields, storeToFormValues } from "../stores-page/store-form-config";
import { errorMessage } from "../../utility/validation";

const StoreDetailsPage = () => {
    const {
        store,
        isLoading,
        isError,
        error,
        isSaving,
        isDeleting,
        isConfirmingDelete,
        setIsConfirmingDelete,
        handleSave,
        handleDelete,
    } = useStoreDetailsPageController();

    if (isLoading) return <Typography variant="body" color="secondary">Loading store…</Typography>;
    if (isError || !store) {
        return <Typography variant="body" color="error">{errorMessage(error, "Store not found.")}</Typography>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-page-header-text">
                    <Typography variant="headline" size="medium" weight="emphasis">{store.storeName}</Typography>
                    <Typography variant="body" size="medium" color="secondary">Store details</Typography>
                </div>
            </div>

            <section className="admin-page-card">
                <CustomForm
                    key={`storeDetailsCustomForm-${store.id}`}
                    formName="storeDetailsCustomForm"
                    initialValues={storeToFormValues(store)}
                    validationSchema={StoreSchema}
                    inputFields={storeInputFields}
                    disabled={isSaving}
                    enableReinitialize
                    onSubmit={handleSave}
                />
                <div className="admin-page-card-actions">
                    <CustomButton size="medium" type="submit" form="storeDetailsCustomForm" disabled={isSaving}>
                        {isSaving ? "Saving…" : "Save changes"}
                    </CustomButton>
                </div>
            </section>

            <section className="admin-page-card">
                <Typography variant="title" size="medium" weight="emphasis">Delete store</Typography>
                <Typography variant="body" size="medium" color="secondary">
                    This permanently removes {store.storeName}. This can't be undone.
                </Typography>
                <div className="admin-page-card-actions">
                    {isConfirmingDelete ?
                        <>
                            <CustomButton variant="text" onClick={() => setIsConfirmingDelete(false)}>Cancel</CustomButton>
                            <CustomButton
                                size="medium"
                                variant="outlined"
                                className="admin-page-danger-button"
                                disabled={isDeleting}
                                onClick={handleDelete}
                            >
                                {isDeleting ? "Deleting…" : "Yes, delete"}
                            </CustomButton>
                        </> :
                        <CustomButton
                            size="medium"
                            variant="outlined"
                            className="admin-page-danger-button"
                            onClick={() => setIsConfirmingDelete(true)}
                        >
                            Delete store
                        </CustomButton>
                    }
                </div>
            </section>
        </div>
    );
};

export default StoreDetailsPage;
