import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const deletePost = async (postId) => {
    const response = await api.delete("/posts/" + postId, {
        headers: {
            Authorization:
                "Bearer " + (await AsyncStorage.getItem("userToken")),
        },
    });

    return response;
};
