import { UserContext } from "@/Layouts/UserLayout";
import { Checkbox } from "flowbite-react";
import { useState, useEffect, useContext } from "react";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { apiFetch, apiLog, backend, logsEvents } from "../Commons/Constants";

export default function PermissionPrivacy() {
    const { t } = useLaravelReactI18n();
    const user = useContext(UserContext);
    const [privacy, setPrivacy] = useState({ privacy_collection: false, privacy_disclosure: false });

    const fetchPrivacy = async () => {
        if (!user.username) return;
        const response = await apiFetch(`/user/privacy/${user.username}`);
        if (response) {
            setPrivacy({
                privacy_disclosure: response.data_disclosure,
                privacy_collection: response.data_collection
            });
        }
    }

    useEffect(() => {
        fetchPrivacy();
    }, [user]);

    const handlePrivacyChange = async (key, value) => {
        const updatedPrivacy = { ...privacy, [key]: value };
        setPrivacy(updatedPrivacy); 
        await apiFetch("/user/privacy", "PUT", {
            data: [{
                user_id: user.username,
                data_collection: updatedPrivacy.privacy_collection,
                data_disclosure: updatedPrivacy.privacy_disclosure
            }]
        });
        apiLog(user.username, 
            logsEvents.USER_PRIVACY_ADD, 
            user.username,
            JSON.stringify({
                data_collection: updatedPrivacy.privacy_collection,
                data_disclosure: updatedPrivacy.privacy_disclosure
            }))


    };

    return (
        <div className="flex flex-col h-full dark:text-white p-5">
            <h1 className="text-2xl p-2">{t("privacy_consent")}</h1>

            <div className="flex flex-col h-full justify-around gap-10">
                <div className="flex flex-col">
                    <p className="p-1">{t("data_collection_info")}</p>
                    <div className="flex">
                        <p className="font-bold p-1">{t("consent_collection")}</p>
                        <div className="flex items-center gap-1">
                            <p className="font-bold p-1">{t("Yes")}</p>
                            <Checkbox className="text-lime-500" checked={privacy.privacy_collection} onChange={() => handlePrivacyChange("privacy_collection", true)} />
                            <p className="font-bold p-1 ml-1">No</p>
                            <Checkbox className="text-lime-500" checked={!privacy.privacy_collection} onChange={() => handlePrivacyChange("privacy_collection", false)} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="p-1">{t("data_sharing_info")}</p>
                    <div className="flex">
                        <p className="font-bold p-1">{t("consent_sharing")}</p>
                        <div className="flex items-center gap-1">
                            <p className="font-bold p-1">{t("Yes")}</p>
                            <Checkbox className="text-lime-500" checked={privacy.privacy_disclosure} onChange={() => handlePrivacyChange("privacy_disclosure", true)} />
                            <p className="font-bold p-1 ml-1">No</p>
                            <Checkbox className="text-lime-500" checked={!privacy.privacy_disclosure} onChange={() => handlePrivacyChange("privacy_disclosure", false)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

