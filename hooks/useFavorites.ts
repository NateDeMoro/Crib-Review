import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useFavorites() {
  const { data: session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user) {
        setFavoriteIds(new Set());
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const favorites = await response.json();
          const ids = new Set<string>(favorites.map((fav: { id: string }) => fav.id));
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [session]);

  const isFavorited = useCallback(
    (housingId: string) => {
      return favoriteIds.has(housingId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (housingId: string) => {
      if (!session?.user) {
        alert("Please sign in to save favorites");
        return false;
      }

      const wasFavorited = favoriteIds.has(housingId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (wasFavorited) {
          newSet.delete(housingId);
        } else {
          newSet.add(housingId);
        }
        return newSet;
      });

      try {
        if (wasFavorited) {
          // Remove favorite
          const response = await fetch(
            `/api/favorites?housingId=${housingId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to remove favorite");
          }
        } else {
          // Add favorite
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ housingId }),
          });

          if (!response.ok) {
            throw new Error("Failed to add favorite");
          }
        }

        return true;
      } catch (error) {
        console.error("Error toggling favorite:", error);

        // Revert optimistic update on error
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          if (wasFavorited) {
            newSet.add(housingId);
          } else {
            newSet.delete(housingId);
          }
          return newSet;
        });

        alert(
          wasFavorited
            ? "Failed to remove favorite. Please try again."
            : "Failed to add favorite. Please try again."
        );
        return false;
      }
    },
    [session, favoriteIds]
  );

  return {
    favoriteIds,
    isFavorited,
    toggleFavorite,
    isLoading,
  };
}
