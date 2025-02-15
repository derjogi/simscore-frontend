'use server'

type IdeaInput = {
  id?: number | string
  author_id?: number | string
  idea: string
}

type IdeaRequest = {
  ideas: IdeaInput[]
  advanced_features?: {
    relationship_graph: boolean,
    pairwise_similarity_matrix: boolean,
    cluster_names: boolean
  }
}

export async function processIdeas(payload: IdeaRequest) {
  const SIMSCORE_API_KEY = process.env.SIMSCORE_API_KEY
  console.log("API Key: ", SIMSCORE_API_KEY)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SIMSCORE_API}/v1/rank_ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SIMSCORE_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Processing failed:', error)
    throw error
  }
}
