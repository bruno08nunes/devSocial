import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import api from "../services/api";

export const fetchPosts = async ({ searchTerm }) => {
    try {
        const response = await api.get(`/posts?q=${searchTerm}`);

        let initialUserLikes = {};
        try {
            const likesResponse = await api.get(`/users/likes`, {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem(
                        "userToken"
                    )}`,
                },
            });
            likesResponse.data.forEach((like) => {
                initialUserLikes[like.post_id] = true;
            });
        } catch (likesError) {
            console.error(
                "Erro ao buscar likes do usuário para inicialização:",
                likesError.response?.data || likesError.message
            );
        }

        let initialUserFavorites = {};
        try {
            const favoritesResponse = await api.get(`/users/favorites`, {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem(
                        "userToken"
                    )}`,
                },
            });
            favoritesResponse.data.forEach((favorite) => {
                initialUserFavorites[favorite.post_id] = true;
            });
        } catch (favoritesError) {
            console.error(
                "Erro ao buscar favoritos do usuário para inicialização:",
                favoritesError.response?.data || favoritesError.message
            );
        }

        return { initialUserLikes, posts: response.data, initialUserFavorites };
    } catch (error) {
        console.error(
            "Erro ao buscar posts:",
            error.response?.data || error.message
        );
        Alert.alert("Erro", "Não foi possível carregar os posts.");

        return null;
    }
};
