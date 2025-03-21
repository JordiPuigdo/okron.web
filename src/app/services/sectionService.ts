import Section from "app/interfaces/Section";

class SectionService {
    private baseUrl: string;

    constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    }

    async getSection(id: string): Promise<Section> {
        try {
            const url = `${this.baseUrl}section/${id}`
            const response = await fetch(url);

            if (!response.ok) {
            throw new Error('Failed to fetch user data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async getSections(): Promise<Section[]> {
        try {
            const url = `${this.baseUrl}section`;
            const response = await fetch(url);

            if (!response.ok) {
            throw new Error('Failed to fetch user data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async updateSection(section : Section ): Promise<Section> {
        try {
            const url = `${this.baseUrl}section`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(section),
            });

            if (!response.ok) {
                throw new Error(`Failed to get preventive`);
            }  
            return await response.json();
        } catch (error) {
            console.error('Error getting preventive:', error);
            throw error;
        }
    }

    async createSection(code : string, description : string ): Promise<Section> {
        try {
            const sectionData = {
                code: code,
                description: description
            };
            const url = `${this.baseUrl}section`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(sectionData),
            });

            if (!response.ok) {
                throw new Error(`Failed to get preventive`);
            }  
            return await response.json();
        } catch (error) {
            console.error('Error getting preventive:', error);
            throw error;
        }
    }

    async deleteSection(id : string ): Promise<boolean> {
        try {
            const url = `${this.baseUrl}section/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get preventive`);
            }  
            return await response.json();
        } catch (error) {
            console.error('Error getting preventive:', error);
            throw error;
        }
    }

}

export default SectionService;