import { Alert } from "react-native";
import api from "../services/api";

export const uploadImage = async ({ newPostImageUri, currentUserId, userToken }) => {
    let imageUrlToSave = null;
    if (newPostImageUri) {
        // Faça o upload da imagem do post primeiro
        const formData = new FormData();
        
        formData.append("postImage", {
            uri: newPostImageUri,
            name: `post_${currentUserId}_${Date.now()}.jpg`,
            type: "image/jpeg",
        });

        try {
            const uploadResponse = await api.post(
                "/upload/post-image",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
            imageUrlToSave = uploadResponse.data.imageUrl; // URL retornada pelo backend
            return imageUrlToSave;
        } catch (uploadError) {
            console.error(
                "Erro ao fazer upload da imagem do post:",
                uploadError.response?.data || uploadError.message
            );
            Alert.alert(
                "Erro de Upload",
                "Não foi possível fazer upload da imagem do post."
            );
            return null;
        }
    }
};
