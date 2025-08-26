// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import PostItem from "../components/PostItem";
import { fetchPosts } from "../utils/fetchPosts";
import { getUserData } from "../utils/getUserData";
import { requestMediaLibraryPermissions } from "../utils/requestMediaLibraryPermissions";
import { likePost } from "../utils/likePost";
import { favoritePost } from "../utils/favoritePost";
import SearchBar from "../components/SearchBar";
import CreatePostContainer from "../components/CreatePostContainer";

const HomeScreen = ({ navigation }) => {
    const { signOut } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [userLikes, setUserLikes] = useState({});
    const [userFavorites, setUserFavorites] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const loadUserId = async () => {
            const userData = await getUserData();
            setCurrentUserId(userData.id);
        };
        loadUserId();
        getPosts();
        requestMediaLibraryPermissions();
    }, [searchTerm, currentUserId]);

    const getPosts = async () => {
        setLoadingPosts(true);
        const result = await fetchPosts({ searchTerm });
        if (!result) {
            return;
        }
        setPosts(result.posts);
        setUserLikes(result.initialUserLikes);
        setUserFavorites(result.initialUserFavorites);
        setLoadingPosts(false);
    };

    const handleToggleLike = async (postId) => {
        try {
            const liked = await likePost(postId);
            if (liked === null) {
                signOut();
            }

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
        const favoritedPost = await favoritePost(postId);
        if (favoritedPost === null) {
            signOut();
        }

        setUserFavorites((prevFav) => ({
            ...prevFav,
            [postId]: favoritedPost,
        }));
    };

    return (
        <View style={styles.container}>
            <Header title={"Fórum do App"} />

            <ScrollView
                style={{
                    maxWidth: "800px",
                    marginHorizontal: "auto",
                    width: "100%",
                }}
            >
                <SearchBar
                    getPosts={getPosts}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {/* Seção para criar novo post */}
                <CreatePostContainer
                    currentUserId={currentUserId}
                    getPosts={getPosts}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    signOut={signOut}
                />

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
                        renderItem={({ item }) => (
                            <PostItem
                                item={item}
                                handleToggleFavorite={handleToggleFavorite}
                                handleToggleLike={handleToggleLike}
                                navigation={navigation}
                                userLikes={userLikes}
                                userFavorites={userFavorites}
                            />
                        )}
                        contentContainerStyle={styles.postList}
                        ListEmptyComponent={
                            <Text style={styles.noPostsText}>
                                Nenhum post encontrado. Tente ajustar sua
                                pesquisa ou seja o primeiro a postar!
                            </Text>
                        }
                    />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5",
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
