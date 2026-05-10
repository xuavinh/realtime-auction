package dto

type CategoryItem struct {
	ID       int32          `json:"id"`
	Name     string         `json:"name"`
	Slug     string         `json:"slug"`
	Children []CategoryItem `json:"children"`
}
