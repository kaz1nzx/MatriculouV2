import Link from "next/link";
import Image from "next/image";
import { CinemaIcon } from "../components/cinema/CinemaIcon";

export default function NotFound() {
  return (
    <main className="missingPage" id="conteudo">
      <Image
        src="/images/cinema/library.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className="missingBackground"
      />
      <div className="missingContent">
        <span className="filmSectionLabel">
          <i />
          Erro 404
        </span>
        <h1>
          Esse caminho
          <br />
          <em>ainda não existe.</em>
        </h1>
        <p>
          A página pode ter mudado de endereço. Busque uma instituição ou volte
          ao início.
        </p>
        <form className="missingSearch" action="/instituicoes" method="get">
          <label className="srOnly" htmlFor="missing-search">
            Buscar uma instituição ou cidade
          </label>
          <CinemaIcon name="search" size={18} />
          <input
            id="missing-search"
            name="q"
            placeholder="Instituição ou cidade"
            required
            maxLength={120}
          />
          <button aria-label="Buscar instituições" type="submit">
            <CinemaIcon name="right" size={20} />
          </button>
        </form>
        <div className="missingActions">
          <Link href="/" className="btn primary">
            Voltar ao início
          </Link>
          <Link href="/cursos" className="btn ghost">
            Explorar cursos
          </Link>
        </div>
      </div>
    </main>
  );
}
