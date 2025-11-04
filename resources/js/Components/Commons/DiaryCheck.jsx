import React, { useEffect, useState } from "react";
import { Modal, Button } from "flowbite-react";
import { diary_link } from "./Constants";
import { ImQuill } from "react-icons/im";

export default function DiaryCheck({ user }) {
    const [showModal, setShowModal] = useState(false);
    const API_URL = "/diary";

    useEffect(() => {
        const fetchDiaryData = async () => {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("Failed to fetch diary data");
                const data = await res.json();
                const userDateStr = data[user.username]; 
                if (!userDateStr) return;

                const [day, month, year] = userDateStr.split("/").map(Number);
                const userDate = new Date(year, month - 1, day);
                const today = new Date();
                const diffDays = Math.floor((today - userDate) / (1000 * 60 * 60 * 24));

                if (diffDays >= 2) setShowModal(true);
            } catch (err) {
                console.error("Error fetching diary data:", err);
            }
        };
        fetchDiaryData();
    }, []);

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)} popup>
                <Modal.Header>Remainder del Diario</Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col items-center mt-3">
                        <p className="text-lg leading-relaxed text-gray-600">
                            Ricordati di compilare il diario una volta ogni tanto 😊
                        </p>
                        <div
                            onClick={() => {setShowModal(false);window.open(diary_link, "_blank", "noopener,noreferrer")}}
                            className="p-2 rounded-md bg-lime-300 flex items-center cursor-pointer hover:bg-lime-400 transition w-[30%] justify-center"
                        >
                            <ImQuill className="size-5"/> Diario
                        </div>

                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
