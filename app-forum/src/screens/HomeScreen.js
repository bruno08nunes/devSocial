// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // <-- Novo
import Header from "../components/Header";
import PostItem from "../components/PostItem";
import { fetchPosts } from "../utils/fetchPosts";

const HomeScreen = ({ navigation }) => {
    const { signOut } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [userLikes, setUserLikes] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);
    const [newPostImageUri, setNewPostImageUri] = useState(null); // <-- Novo: URI da imagem do novo post

    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userDataString = await AsyncStorage.getItem("userData");
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    setCurrentUserId(userData.id);
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar dados do usuário do AsyncStorage:",
                    error
                );
            }
        };
        loadUserId();
        getPosts();

        // Pedir permissão para acessar a galeria de imagens
        (async () => {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permissão Negada",
                    "Desculpe, precisamos de permissões de galeria para isso funcionar!"
                );
            }
        })();
    }, [searchTerm, currentUserId]);

    const getPosts = async () => {
        setLoadingPosts(true);
        const result = await fetchPosts({ searchTerm });
        if (!result) {
            return;
        }
        setPosts(result.posts);
        setUserLikes(result.initialUserLikes);
        setLoadingPosts(false);
    };

    const pickPostImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3], // Ajuste conforme preferir
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewPostImageUri(result.assets[0].uri);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            Alert.alert(
                "Erro",
                "Título e conteúdo do post não podem ser vazios."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const userToken = await AsyncStorage.getItem("userToken");
            if (!userToken) {
                Alert.alert(
                    "Erro de Autenticação",
                    "Você precisa estar logado para criar um post."
                );
                signOut();
                return;
            }

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
                } catch (uploadError) {
                    console.error(
                        "Erro ao fazer upload da imagem do post:",
                        uploadError.response?.data || uploadError.message
                    );
                    Alert.alert(
                        "Erro de Upload",
                        "Não foi possível fazer upload da imagem do post."
                    );
                    setIsSubmitting(false);
                    return;
                }
            }

            await api.post(
                "/posts",
                {
                    title: newPostTitle,
                    content: newPostContent,
                    image_url: imageUrlToSave,
                }, // Envia a URL da imagem
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            Alert.alert("Sucesso", "Post criado com sucesso!");
            setNewPostTitle("");
            setNewPostContent("");
            setNewPostImageUri(null); // Limpa a imagem selecionada
            getPosts(); // Recarrega os posts
        } catch (error) {
            console.error(
                "Erro ao criar post:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Erro ao Criar Post",
                error.response?.data?.message ||
                    "Ocorreu um erro ao criar o post."
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                signOut();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            const userToken = await AsyncStorage.getItem("userToken");
            if (!userToken) {
                Alert.alert(
                    "Erro",
                    "Você precisa estar logado para curtir posts."
                );
                signOut();
                return;
            }
            const response = await api.post(
                `/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            const liked = response.data.liked;
            setUserLikes((prevLikes) => ({
                ...prevLikes,
                [postId]: liked,
            }));

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              likes_count: liked
                                  ? post.likes_count + 1
                                  : Math.max(0, post.likes_count - 1),
                          }
                        : post
                )
            );
        } catch (error) {
            console.error(
                "Erro ao curtir/descurtir:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Erro",
                error.response?.data?.message ||
                    "Não foi possível processar o like."
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                signOut();
            }
        }
    };

    const handleToggleFavorite = async (postId) => {
        try {
            const userToken = await AsyncStorage.getItem("userToken");
            if (!userToken) {
                Alert.alert(
                    "Erro",
                    "Você precisa estar logado para favoritar posts."
                );
                signOut();
                return;
            }
            const response = await api.post(
                `/posts/${postId}/favorite`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            Alert.alert("Sucesso", response.data.message);
        } catch (error) {
            console.error(
                "Erro ao favoritar/desfavoritar:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Erro",
                error.response?.data?.message ||
                    "Não foi possível processar o favorito."
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                signOut();
            }
        }
    };

    return (
        <View style={styles.container}>
            <Header title={"Fórum do App"} />

            <View
                style={{
                    maxWidth: "800px",
                    marginHorizontal: "auto",
                    width: "100%",
                }}
            >
                {/* Barra de Pesquisa */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Pesquisar posts por título ou conteúdo..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onSubmitEditing={getPosts}
                    />
                    <TouchableOpacity
                        onPress={getPosts}
                        style={styles.searchButton}
                    >
                        <Ionicons name="search" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Seção para criar novo post */}
                <View style={styles.createPostContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Título do seu post"
                        value={newPostTitle}
                        onChangeText={setNewPostTitle}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            { height: 100, textAlignVertical: "top" },
                        ]}
                        placeholder="O que você quer compartilhar?"
                        value={newPostContent}
                        onChangeText={setNewPostContent}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={pickPostImage}
                        style={styles.imagePickerButton}
                    >
                        <Ionicons
                            name="image-outline"
                            size={24}
                            color="#007bff"
                        />
                        <Text style={styles.imagePickerButtonText}>
                            Adicionar Imagem
                        </Text>
                    </TouchableOpacity>
                    {newPostImageUri && (
                        <Image
                            source={{ uri: newPostImageUri }}
                            style={styles.previewImage}
                        />
                    )}
                    <Button
                        title={isSubmitting ? "Publicando..." : "Criar Post"}
                        onPress={handleCreatePost}
                        disabled={isSubmitting}
                    />
                </View>

                {/* Lista de Posts */}
                {loadingPosts ? (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        style={{ marginTop: 20 }}
                    />
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <PostItem item={item} handleToggleFavorite={handleToggleFavorite} handleToggleLike={handleToggleLike} navigation={navigation} userLikes={userLikes} />}
                        contentContainerStyle={styles.postList}
                        ListEmptyComponent={
                            <Text style={styles.noPostsText}>
                                Nenhum post encontrado. Tente ajustar sua
                                pesquisa ou seja o primeiro a postar!
                            </Text>
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        margin: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: "#007bff",
        padding: 8,
        borderRadius: 5,
    },
    createPostContainer: {
        backgroundColor: "#fff",
        padding: 20,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    imagePickerButton: {
        // Novo estilo
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e9f5ff",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        marginBottom: 10,
    },
    imagePickerButtonText: {
        // Novo estilo
        marginLeft: 10,
        color: "#007bff",
        fontWeight: "bold",
    },
    previewImage: {
        // Novo estilo
        width: "100%",
        height: 150,
        borderRadius: 8,
        resizeMode: "cover",
        marginBottom: 10,
    },
    postList: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    noPostsText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#777",
    },
});

export default HomeScreen;
