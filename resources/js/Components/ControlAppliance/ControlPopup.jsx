import { LightPopup } from "./LightPopup"
import { MediaPlayerPopup } from "./MediaPlayerPopup"

export default function ControlPopup({ applianceId, open, closeFun, classDevice }) {
    return (
        <>
            {classDevice == "light" && 
                <LightPopup selectedEntity={applianceId}
                    open={open} closeFun={closeFun} />
            }
            {classDevice == "media_player" &&
                <MediaPlayerPopup selectedEntity={applianceId}
                    open={open} closeFun={closeFun}
                />
            }
        </>
    )
}