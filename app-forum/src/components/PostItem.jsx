import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PostItem = ({
    item,
    handleToggleFavorite,
    handleToggleLike,
    userLikes,
    navigation,
    userFavorites,
}) => (
    <View style={styles.postCard}>
        <View style={styles.postHeader}>
            {item.profile_picture_url ? (
                <Image
                    source={{
                        uri: `http://localhost:3001${item.profile_picture_url}`,
                    }}
                    style={styles.profilePicture}
                />
            ) : (
                <Ionicons
                    name="person-circle"
                    size={40}
                    color="#ccc"
                    style={styles.profilePicturePlaceholder}
                />
            )}
            <Text style={styles.postUsername}>{item.username}</Text>
        </View>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>
        {item.image_url && (
            <Image
                source={{ uri: `http://localhost:3001${item.image_url}` }}
                style={styles.postImage}
            />
        )}
        <View style={styles.postFooter}>
            <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => handleToggleLike(item.id)}
            >
                <Ionicons
                    name={userLikes[item.id] ? "heart" : "heart-outline"}
                    size={24}
                    color={userLikes[item.id] ? "red" : "#666"}
                />
                <Text style={styles.interactionText}>{item.likes_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.interactionButton}
                onPress={() =>
                    navigation.navigate("PostDetail", { postId: item.id })
                }
            >
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.interactionText}>
                    {item.comments_count}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => handleToggleFavorite(item.id)}
            >
                <Ionicons
                    name={
                        userFavorites[item.id] ? "bookmark" : "bookmark-outline"
                    }
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    postCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    profilePicturePlaceholder: {
        marginRight: 10,
    },
    postUsername: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#555",
    },
    postTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    postContent: {
        fontSize: 15,
        lineHeight: 22,
        color: "#666",
        marginBottom: 10,
    },
    postImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginTop: 10,
        resizeMode: "cover",
    },
    postFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    interactionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    interactionText: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666",
    },
});

export default PostItem;
